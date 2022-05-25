export interface Application {
    name: string | undefined;
    code: string | undefined;
    address: string | undefined;
    manufacturer: string | undefined;
    registration: string | undefined;
    player: number | undefined;
    url: string | undefined;
}

const state: Application = {
    name: undefined,
    code: undefined,
    address: undefined,
    manufacturer: undefined,
    registration: undefined,
    player: undefined,
    url: undefined,
};

export default state;
