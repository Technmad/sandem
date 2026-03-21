declare const _default: import("convex/server").SchemaDefinition<{
    projects: import("convex/server").TableDefinition<import("convex/values").VObject<{
        entry?: string | undefined;
        owner: string;
        title: string;
        files: {
            contents: string;
            name: string;
        }[];
        room: string;
    }, {
        title: import("convex/values").VString<string, "required">;
        files: import("convex/values").VArray<{
            contents: string;
            name: string;
        }[], import("convex/values").VObject<{
            contents: string;
            name: string;
        }, {
            name: import("convex/values").VString<string, "required">;
            contents: import("convex/values").VString<string, "required">;
        }, "required", "contents" | "name">, "required">;
        owner: import("convex/values").VString<string, "required">;
        room: import("convex/values").VString<string, "required">;
        entry: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "owner" | "title" | "files" | "room" | "entry">, {
        by_owner: ["owner", "_creationTime"];
    }, {}, {}>;
    projectSeedState: import("convex/server").TableDefinition<import("convex/values").VObject<{
        owner: string;
        starterProjectSeeded: boolean;
        seededAt: number;
    }, {
        owner: import("convex/values").VString<string, "required">;
        starterProjectSeeded: import("convex/values").VBoolean<boolean, "required">;
        seededAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "owner" | "starterProjectSeeded" | "seededAt">, {
        by_owner: ["owner", "_creationTime"];
    }, {}, {}>;
}, true>;
export default _default;
