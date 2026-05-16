export declare const Role: {
    readonly CUSTOMER: "CUSTOMER";
    readonly ADMIN: "ADMIN";
    readonly SUPER_ADMIN: "SUPER_ADMIN";
};
export type Role = (typeof Role)[keyof typeof Role];
