# Solidity API

## Market

Market is a contract designed to facilitate the interaction between job offerings and job seekers.
    An employer can create jobs, which an employee can take up. Both must be registered and the job
    must initially be funded by the employer. When a job is complete, the escrow payment is released
    and the protocol takes a fee, unless the

### Contract
Market : contracts/1_Market.sol

 --- 
### Modifiers:
### onlyRegistered

```solidity
modifier onlyRegistered(address _user)
```

### jobExists

```solidity
modifier jobExists(uint256 _jobId)
```

 --- 
### Functions:
### registerUser

```solidity
function registerUser(address user) external
```

### createJob

```solidity
function createJob(address user, string _description, uint256 _deadline) external payable
```

### acceptJob

```solidity
function acceptJob(address user, uint256 _jobId) external
```

### completeJob

```solidity
function completeJob(address user, uint256 _jobId) external
```

### releasePayment

```solidity
function releasePayment(address user, uint256 _jobId) external
```

### submitRating

```solidity
function submitRating(address user, uint256 _jobId, uint256 _rating) external
```

### initiateDispute

```solidity
function initiateDispute(address user, uint256 _jobId) external
```

### updateReputation

```solidity
function updateReputation(address _user, uint256 _rating) internal
```

### getUserReputation

```solidity
function getUserReputation(address _user) external view returns (uint256)
```

### getJobDetails

```solidity
function getJobDetails(uint256 _jobId) external view returns (address employer, address employee, uint256 payment, enum Market.JobStatus status, uint256 deadline, string description)
```

### updatePlatformMakerFee

```solidity
function updatePlatformMakerFee(uint256 _newFee) external
```

### updatePlatformTakerFee

```solidity
function updatePlatformTakerFee(uint256 _newFee) external
```

### updateAgentAddress

```solidity
function updateAgentAddress(address _newAgent) external
```

### resolveDispute

```solidity
function resolveDispute(uint256 _jobId, address _winner) external
```

### withdrawTreasury

```solidity
function withdrawTreasury() external
```

inherits Ownable:
### owner

```solidity
function owner() public view virtual returns (address)
```

_Returns the address of the current owner._

### _checkOwner

```solidity
function _checkOwner() internal view virtual
```

_Throws if the sender is not the owner._

### renounceOwnership

```solidity
function renounceOwnership() public virtual
```

_Leaves the contract without owner. It will not be possible to call
`onlyOwner` functions. Can only be called by the current owner.

NOTE: Renouncing ownership will leave the contract without an owner,
thereby disabling any functionality that is only available to the owner._

### transferOwnership

```solidity
function transferOwnership(address newOwner) public virtual
```

_Transfers ownership of the contract to a new account (`newOwner`).
Can only be called by the current owner._

### _transferOwnership

```solidity
function _transferOwnership(address newOwner) internal virtual
```

_Transfers ownership of the contract to a new account (`newOwner`).
Internal function without access restriction._

inherits ReentrancyGuard:
### _reentrancyGuardEntered

```solidity
function _reentrancyGuardEntered() internal view returns (bool)
```

_Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
`nonReentrant` function in the call stack._

 --- 
### Events:
### UserRegistered

```solidity
event UserRegistered(address user)
```

### JobCreated

```solidity
event JobCreated(uint256 jobId, address employer, uint256 payment)
```

### JobAssigned

```solidity
event JobAssigned(uint256 jobId, address employee)
```

### JobCompleted

```solidity
event JobCompleted(uint256 jobId)
```

### JobDisputed

```solidity
event JobDisputed(uint256 jobId)
```

### RatingSubmitted

```solidity
event RatingSubmitted(uint256 jobId, address rater, address rated)
```

### PaymentReleased

```solidity
event PaymentReleased(uint256 jobId, address employee, uint256 amount)
```

inherits Ownable:
### OwnershipTransferred

```solidity
event OwnershipTransferred(address previousOwner, address newOwner)
```

inherits ReentrancyGuard:

