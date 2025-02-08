export function storeUserData(data: any): Promise<void>;
export function retrieveUserData(userId: string): Promise<any>;
export function createBounty(data: any): Promise<void>;
export function getBountyList(owner: any): Promise<any>;
export function matchBounties(userId: string): Promise<any>;
export function deleteBounty(id: string): Promise<void>; //Bounties need an id to be deleted, completion criteria

export function testFn(): void; 