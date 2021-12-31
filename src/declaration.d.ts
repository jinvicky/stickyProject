declare module "*.css" {
    const mapping: Record<string, string>;
    export default mapping;
}

declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
}