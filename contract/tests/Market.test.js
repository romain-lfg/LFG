const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Market", function () {
    let Market;
    let market;
    let owner;
    let employer;
    let employee;
    let addr3;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        Market = await ethers.getContractFactory("Market");
        [owner, employer, employee, addr3] = await ethers.getSigners();

        // Deploy a new Market contract before each test
        market = await Market.deploy();
        await market.deployed();
    });

    describe("User Registration", function () {
        it("Should allow users to register", async function () {
            await market.connect(employer).registerUser(employer.address);
            const user = await market.users(employer.address);
            expect(user.isRegistered).to.equal(true);
            expect(user.reputation).to.equal(100); // Starting reputation
        });

        it("Should not allow double registration", async function () {
            await market.connect(employer).registerUser(employer.address);
            await expect(
                market.connect(employer).registerUser(employer.address)
            ).to.be.revertedWith("User already registered");
        });
    });

    describe("Job Creation and Assignment", function () {
        beforeEach(async function () {
            // Register users before each test in this block
            await market.connect(employer).registerUser(employer.address);
            await market.connect(employee).registerUser(employee.address);
        });

        it("Should create a job correctly", async function () {
            const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
            const payment = ethers.utils.parseEther("1.0");
            
            await market.connect(employer).createJob(
                employer.address,
                "Test job description",
                deadline,
                { value: payment }
            );

            const job = await market.jobs(0);
            expect(job.employer).to.equal(employer.address);
            expect(job.payment).to.equal(payment);
            expect(job.status).to.equal(0); // JobStatus.Open
        });

        it("Should allow job assignment", async function () {
            const deadline = Math.floor(Date.now() / 1000) + 86400;
            const payment = ethers.utils.parseEther("1.0");
            
            await market.connect(employer).createJob(
                employer.address,
                "Test job description",
                deadline,
                { value: payment }
            );

            await market.connect(employee).acceptJob(employee.address, 0);
            
            const job = await market.jobs(0);
            expect(job.employee).to.equal(employee.address);
            expect(job.status).to.equal(1); // JobStatus.Assigned
        });

        it("Should not allow employer to accept their own job", async function () {
            const deadline = Math.floor(Date.now() / 1000) + 86400;
            const payment = ethers.utils.parseEther("1.0");
            
            await market.connect(employer).createJob(
                employer.address,
                "Test job description",
                deadline,
                { value: payment }
            );

            await expect(
                market.connect(employer).acceptJob(employer.address, 0)
            ).to.be.revertedWith("Employer cannot accept own job");
        });
    });

    describe("Job Completion and Payment", function () {
        let jobId;
        let payment;

        beforeEach(async function () {
            // Setup for each test
            await market.connect(employer).registerUser(employer.address);
            await market.connect(employee).registerUser(employee.address);
            
            payment = ethers.utils.parseEther("1.0");
            const deadline = Math.floor(Date.now() / 1000) + 86400;
            
            await market.connect(employer).createJob(
                employer.address,
                "Test job description",
                deadline,
                { value: payment }
            );
            
            await market.connect(employee).acceptJob(employee.address, 0);
            jobId = 0;
        });

        it("Should complete job and release payment correctly", async function () {
            await market.connect(employee).completeJob(employee.address, jobId);
            
            const employeeInitialBalance = await employee.getBalance();
            
            await market.connect(employer).releasePayment(employer.address, jobId);
            
            const employeeFinalBalance = await employee.getBalance();
            const expectedPayment = payment.mul(99).div(100);
            
            expect(employeeFinalBalance.sub(employeeInitialBalance)).to.equal(expectedPayment);
        });

        it("Should update job counts after completion", async function () {
            await market.connect(employee).completeJob(employee.address, jobId);
            await market.connect(employer).releasePayment(employer.address, jobId);
            
            const employerData = await market.users(employer.address);
            const employeeData = await market.users(employee.address);
            
            expect(employerData.totalJobs).to.equal(1);
            expect(employeeData.totalJobs).to.equal(1);
        });
    });

    describe("Dispute Resolution", function () {
        let jobId;
        let payment;

        beforeEach(async function () {
            // Setup for each test
            await market.connect(employer).registerUser(employer.address);
            await market.connect(employee).registerUser(employee.address);
            
            payment = ethers.utils.parseEther("1.0");
            const deadline = Math.floor(Date.now() / 1000) + 86400;
            
            await market.connect(employer).createJob(
                employer.address,
                "Test job description",
                deadline,
                { value: payment }
            );
            
            await market.connect(employee).acceptJob(employee.address, 0);
            jobId = 0;
        });

        it("Should allow dispute initiation", async function () {
            await market.connect(employer).initiateDispute(employer.address, jobId);
            const job = await market.jobs(jobId);
            expect(job.status).to.equal(3); // JobStatus.Disputed
        });

        it("Should resolve dispute in favor of employee", async function () {
            await market.connect(employee).initiateDispute(employee.address, jobId);
            
            const employeeInitialBalance = await employee.getBalance();
            
            await market.connect(owner).resolveDispute(jobId, employee.address);
            
            const employeeFinalBalance = await employee.getBalance();
            const expectedPayment = payment.mul(99).div(100); // 99% of payment (1% platform fee)
            
            expect(employeeFinalBalance.sub(employeeInitialBalance)).to.equal(expectedPayment);
        });

        it("Should resolve dispute in favor of employer", async function () {
            await market.connect(employer).initiateDispute(employer.address, jobId);
            
            const employerInitialBalance = await employer.getBalance();
            
            await market.connect(owner).resolveDispute(jobId, employer.address);
            
            const employerFinalBalance = await employer.getBalance();
            
            expect(employerFinalBalance.sub(employerInitialBalance)).to.equal(payment);
        });
    });

    describe("Rating System", function () {
        let jobId;

        beforeEach(async function () {
            // Setup for each test
            await market.connect(employer).registerUser(employer.address);
            await market.connect(employee).registerUser(employee.address);
            
            const payment = ethers.utils.parseEther("1.0");
            const deadline = Math.floor(Date.now() / 1000) + 86400;
            
            await market.connect(employer).createJob(
                employer.address,
                "Test job description",
                deadline,
                { value: payment }
            );
            
            await market.connect(employee).acceptJob(employee.address, 0);
            await market.connect(employee).completeJob(employee.address, 0);
            await market.connect(employer).releasePayment(employer.address, 0);
            jobId = 0;
        });

        it("Should allow rating submission", async function () {
            await market.connect(employer).submitRating(employer.address, jobId, 5);
            await market.connect(employee).submitRating(employee.address, jobId, 4);
            
            const employerReputation = await market.getUserReputation(employer.address);
            const employeeReputation = await market.getUserReputation(employee.address);
            
            expect(employerReputation).to.be.gt(0);
            expect(employeeReputation).to.be.gt(0);
        });

        it("Should not allow double rating", async function () {
            await market.connect(employer).submitRating(employer.address, jobId, 5);
            
            await expect(
                market.connect(employer).submitRating(employer.address, jobId, 4)
            ).to.be.revertedWith("Employer has already rated");
        });
    });
});