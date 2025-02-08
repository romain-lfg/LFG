//export function storeUserData(data: any): Promise<void>;
//export function retrieveUserData(userId: string): Promise<any>;
export function matchBounties(userId: string): Promise<any>;
//export function deleteBounty(id: string): Promise<void>; //Bounties need an id to be deleted, completion criteria

export function testFn(): void;


//Working Functions
export function createBounty(data: any): Promise<void>;
export async function getBountyList(): Promise<any>;
export function clearBounties(): Promise<void>;

export function createUser(data: any): Promise<void>;
export function getUserList(): Promise<any>;
export function clearUsers(): Promise<void>;

