export declare const createProject: import("convex/server").RegisteredMutation<"public", {
    room?: string | undefined;
    entry?: string | undefined;
    owner: string;
    title: string;
    files: {
        contents: string;
        name: string;
    }[];
}, Promise<import("convex/values").GenericId<"projects">>>;
export declare const ensureLiveblocksRoomsForOwner: import("convex/server").RegisteredMutation<"public", {
    owner: string;
}, Promise<number>>;
export declare const getProjects: import("convex/server").RegisteredQuery<"public", {
    owner: string;
}, Promise<{
    _id: import("convex/values").GenericId<"projects">;
    _creationTime: number;
    entry?: string | undefined;
    owner: string;
    title: string;
    files: {
        contents: string;
        name: string;
    }[];
    room: string;
}[]>>;
export declare const ensureStarterProjectForOwner: import("convex/server").RegisteredMutation<"public", {
    owner: string;
}, Promise<string | null>>;
export declare const getProject: import("convex/server").RegisteredQuery<"public", {
    id: import("convex/values").GenericId<"projects">;
}, Promise<{
    _id: import("convex/values").GenericId<"projects">;
    _creationTime: number;
    entry?: string | undefined;
    owner: string;
    title: string;
    files: {
        contents: string;
        name: string;
    }[];
    room: string;
} | null>>;
export declare const openCollab: import("convex/server").RegisteredQuery<"public", {
    owner: string;
    room: string;
}, Promise<{
    _id: import("convex/values").GenericId<"projects">;
    _creationTime: number;
    entry?: string | undefined;
    owner: string;
    title: string;
    files: {
        contents: string;
        name: string;
    }[];
    room: string;
} | null>>;
export declare const updateProject: import("convex/server").RegisteredMutation<"public", {
    title?: string | undefined;
    files?: {
        contents: string;
        name: string;
    }[] | undefined;
    room?: string | undefined;
    entry?: string | undefined;
    id: import("convex/values").GenericId<"projects">;
}, Promise<void>>;
export declare const updateProjectFiles: import("convex/server").RegisteredMutation<"public", {
    id: import("convex/values").GenericId<"projects">;
    files: {
        contents: string;
        name: string;
    }[];
}, Promise<{
    updated: number;
    total: number;
}>>;
export declare const deleteProject: import("convex/server").RegisteredMutation<"public", {
    id: import("convex/values").GenericId<"projects">;
}, Promise<void>>;
