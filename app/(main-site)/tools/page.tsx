import ToolCard from "@/components/ToolCard";
import PageContainer from "@/components/PageContainer";

const tools = [
    {
        title: "Capture Photo",
        description: "Take photos using your device camera.",
        href: "/capture-photo",
    },
    {
        title: "Lossless Compression",
        description: "Compress images without visible quality loss.",
        href: "/lossless-compression",
    },
    {
        title: "Lossy Compression",
        description: "Reduce image size with adjustable quality.",
        href: "/lossy-compression",
    },
    {
        title: "Metadata Viewer",
        description: "View EXIF metadata from images.",
        href: "/metadata-viewer",
    },
    {
        title: "Crop Image",
        description: "Crop and download images.",
        href: "/crop-image",
    },
];

export default function ToolsPage() {
    return (
        <PageContainer>
            <div className="page-header">
                <h1>Image Utilities</h1>
                <p className="page-description">
                    Browser-based tools for capturing, cropping and compressing
                    images without uploading anything.
                </p>
            </div>

            <div className="tools-grid">
                {tools.map((tool) => (
                    <ToolCard
                        key={tool.href}
                        title={tool.title}
                        description={tool.description}
                        href={tool.href}
                    />
                ))}
            </div>
        </PageContainer>
    );
}
