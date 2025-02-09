// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
/**
    Market is a contract designed to facilitate the interaction between job offerings and job seekers.
    An employer can create jobs, which an employee can take up. Both must be registered and the job
    must initially be funded by the employer. When a job is complete, the escrow payment is released
    and the protocol takes a fee, unless the 
 */
contract Market is ReentrancyGuard, Ownable(msg.sender) {
    struct User {
        uint256 reputation;
        uint256 totalJobs;
        uint256 totalRatings;
        bool isRegistered;
    }

    struct Job {
        address employer;
        address employee;
        uint256 payment;
        JobStatus status;
        uint256 deadline;
        string description;
        bool employerRated;
        bool employeeRated;
    }

    enum JobStatus {
        Open,
        Assigned,
        Completed,
        Disputed,
        Cancelled
    }

    // Agent variables
    address agent = 0xf94563b7013384EB4b3243D37250068Ee483857a;

    // State variables
    mapping(address => User) public users;
    mapping(uint256 => Job) public jobs;
    uint256 public jobCounter;
    uint256 public platformTakerFee = 1;
    uint256 public platformMakerFee = 0;
    uint256 public accumulatedFees;

    // Events
    event UserRegistered(address indexed user);
    event JobCreated(uint256 indexed jobId, address indexed employer, uint256 payment);
    event JobAssigned(uint256 indexed jobId, address indexed employee);
    event JobCompleted(uint256 indexed jobId);
    event JobDisputed(uint256 indexed jobId);
    event RatingSubmitted(uint256 indexed jobId, address indexed rater, address indexed rated);
    event PaymentReleased(uint256 indexed jobId, address indexed employee, uint256 amount);

    // Modifiers
    modifier onlyRegistered(address _user) {
        require(users[_user].isRegistered, "User not registered");
        _;
    }

    modifier jobExists(uint256 _jobId) {
        require(_jobId < jobCounter, "Job does not exist");
        _;
    }

    // Main functions
    function registerUser(address user) external {
        require(msg.sender == user || msg.sender == agent, "User must send the transaction.");
        require(!users[user].isRegistered, "User already registered");
        
        users[user] = User({
            reputation: 100,
            totalJobs: 0,
            totalRatings: 0,
            isRegistered: true
        });

        emit UserRegistered(user);
    }

    function createJob(address user, string calldata _description, uint256 _deadline) 
        external 
        payable 
        onlyRegistered(user) 
        nonReentrant 
    {
        require(msg.sender == user || msg.sender == agent, "User must send the transaction.");
        require(msg.value > 0, "Payment must be greater than 0");
        require(_deadline > block.timestamp, "Invalid deadline");

        jobs[jobCounter] = Job({
            employer: user,
            employee: address(0),
            payment: msg.value,
            status: JobStatus.Open,
            deadline: _deadline,
            description: _description,
            employerRated: false,
            employeeRated: false
        });

        emit JobCreated(jobCounter, user, msg.value);
        jobCounter++;
    }

    function acceptJob(address user, uint256 _jobId) 
        external 
        onlyRegistered(user)
        jobExists(_jobId) 
        nonReentrant 
    {
        Job storage job = jobs[_jobId];
        require(msg.sender == user || msg.sender == agent, "User must send the transaction.");
        require(job.status == JobStatus.Open, "Job not open");
        require(job.employer != user, "Employer cannot accept own job");

        job.employee = user;
        job.status = JobStatus.Assigned;

        emit JobAssigned(_jobId, user);
    }

    function completeJob(address user, uint256 _jobId) 
        external 
        jobExists(_jobId) 
        nonReentrant 
    {
        Job storage job = jobs[_jobId];
        require(msg.sender == user || msg.sender == agent, "User must send the transaction.");
        require(user == job.employee, "Only employee can complete job");
        require(job.status == JobStatus.Assigned, "Invalid job status");

        job.status = JobStatus.Completed;
        emit JobCompleted(_jobId);
    }

    function releasePayment(address user, uint256 _jobId) 
        external 
        jobExists(_jobId) 
        nonReentrant 
    {
        // Transfers payment to employee and platform fee to treasury
        Job storage job = jobs[_jobId];
        require(msg.sender == user || msg.sender == agent, "User must send the transaction.");
        require(msg.sender == job.employer || msg.sender == agent, "Only employer can release payment");
        require(job.status == JobStatus.Completed, "Job not completed");

        uint256 platformTakerFeeAmount = (job.payment * platformTakerFee) / 100;
        uint256 paymentAmount = job.payment - platformTakerFeeAmount;

        job.status = JobStatus.Completed;
        users[job.employee].totalJobs++;
        users[job.employer].totalJobs++;

        accumulatedFees += platformTakerFeeAmount;

        (bool success, ) = payable(job.employee).call{value: paymentAmount}("");
        require(success, "Payment transfer failed");

        emit PaymentReleased(_jobId, job.employee, paymentAmount);
    }

    function submitRating(address user, uint256 _jobId, uint256 _rating) 
        external 
        jobExists(_jobId) 
        nonReentrant 
    {
        require(_rating >= 1 && _rating <= 5, "Invalid rating");
        Job storage job = jobs[_jobId];
        require(msg.sender == user || msg.sender == agent, "User must send the transaction.");
        require(job.status == JobStatus.Completed, "Job not completed");
        require(msg.sender == job.employer || msg.sender == job.employee || msg.sender == agent, "Not authorized");

        if (user == job.employer) {
            require(!job.employerRated, "Employer has already rated");
            job.employerRated = true;
            updateReputation(job.employee, _rating);
            emit RatingSubmitted(_jobId, job.employer, job.employee);
        } else {
            require(!job.employeeRated, "Employee has already rated");
            job.employeeRated = true;
            updateReputation(job.employer, _rating);
            emit RatingSubmitted(_jobId, job.employee, job.employer);
        }
    }

    function initiateDispute(address user, uint256 _jobId) 
        external 
        jobExists(_jobId) 
        nonReentrant 
    {
        Job storage job = jobs[_jobId];
        require(msg.sender == user || msg.sender == agent, "User must send the transaction.");
        require(msg.sender == job.employer || msg.sender == job.employee || msg.sender == agent, "Not authorized");
        require(job.status == JobStatus.Assigned || job.status == JobStatus.Completed, "Invalid job status");

        job.status = JobStatus.Disputed;
        emit JobDisputed(_jobId);
    }

    // Internal functions
    function updateReputation(address _user, uint256 _rating) internal {
        User storage user = users[_user];
        uint256 currentReputation = user.reputation;
        uint256 totalRatings = user.totalRatings;

        // Calculate new reputation as weighted average
        user.reputation = ((currentReputation * totalRatings) + (_rating * 20)) / (totalRatings + 1);
        user.totalRatings++;
    }

    // View functions
    function getUserReputation(address _user) external view returns (uint256) {
        return users[_user].reputation;
    }

    function getJobDetails(uint256 _jobId) 
        external 
        view 
        returns (
            address employer,
            address employee,
            uint256 payment,
            JobStatus status,
            uint256 deadline,
            string memory description
        ) 
    {
        Job storage job = jobs[_jobId];
        return (
            job.employer,
            job.employee,
            job.payment,
            job.status,
            job.deadline,
            job.description
        );
    }

    // Admin functions
    function updatePlatformMakerFee(uint256 _newFee) external onlyOwner {
        // Updates platform fee
        platformMakerFee = _newFee;
    }

    function updatePlatformTakerFee(uint256 _newFee) external onlyOwner {
        // Updates platform fee
        platformTakerFee = _newFee;
    }

    function updateAgentAddress(address _newAgent) external onlyOwner {
        // Updates agent address
        agent = _newAgent;
    }

    function resolveDispute(uint256 _jobId, address _winner) 
        external 
        onlyOwner 
        jobExists(_jobId) 
        nonReentrant 
    {
        // 
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Disputed, "Job not disputed");
        require(_winner == job.employer || _winner == job.employee, "Invalid winner address");

        if (_winner == job.employer) {
            uint256 platformMakerFeeAmount = (job.payment * platformMakerFee) / 100;
            uint256 refundAmount = job.payment - platformMakerFeeAmount;

            accumulatedFees += platformMakerFeeAmount;
            
            (bool success, ) = payable(job.employer).call{value: refundAmount}("");
            require(success, "Refund transfer failed");

            // If employer won, employee gets bad rating
            require(!job.employeeRated, "Employee has already rated");
            job.employeeRated = true;
            updateReputation(job.employer, 5);
            emit RatingSubmitted(_jobId, job.employee, job.employer);

            require(!job.employerRated, "Employer has already rated");
            job.employerRated = true;
            updateReputation(job.employee, 1);
            emit RatingSubmitted(_jobId, job.employer, job.employee);

        } else {
            uint256 platformTakerFeeAmount = (job.payment * platformTakerFee) / 100;
            uint256 paymentAmount = job.payment - platformTakerFeeAmount;

            accumulatedFees += platformTakerFeeAmount;
            
            (bool success, ) = payable(job.employee).call{value: paymentAmount}("");
            require(success, "Payment transfer failed");

            require(!job.employeeRated, "Employee has already rated");
            job.employeeRated = true;
            updateReputation(job.employer, 1);
            emit RatingSubmitted(_jobId, job.employee, job.employer);

            require(!job.employerRated, "Employer has already rated");
            job.employerRated = true;
            updateReputation(job.employee, 5);
            emit RatingSubmitted(_jobId, job.employer, job.employee);
        }

        job.status = JobStatus.Completed;
    }

    function withdrawTreasury() 
        external 
        onlyOwner 
        nonReentrant 
    {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Treasury withdrawal failed");
    }
}