// NOTE: The declaration below was injected by `"framer"`
// see https://www.framer.com/docs/guides/handshake for more information.
declare module "https://framer.com/m/*";

// GLSL shader declarations
declare module "*.glsl" {
    const content: string;
    export default content;
}

declare module "*.glsl?raw" {
    const content: string;
    export default content;
}

declare module "*.vs" {
    const content: string;
    export default content;
}

declare module "*.fs" {
    const content: string;
    export default content;
}

declare module "*.vert" {
    const content: string;
    export default content;
}

declare module "*.frag" {
    const content: string;
    export default content;
}

// Custom R3F shader materials
declare global {
    namespace JSX {
        interface IntrinsicElements {
            heatMaterial: any
        }
    }
}
