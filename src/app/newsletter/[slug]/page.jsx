import { notFound } from "next/navigation";
import { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/blog.model";

const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://solvestic.com"
).replace(/\/$/, "");

async function getBlog(slug) {
    await connectDB();

    return Blog.findOne({ permalink: slug }).lean();
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const blog = await getBlog(slug);

    if (!blog) {
        return {
            title: "Blog Not Found | Solvestic",
            robots: { index: false, follow: false },
        };
    }

    const title = blog.metaTitle?.trim() || blog.title;
    const description =
        blog.metaDescription?.trim() ||
        `Read ${blog.title} on the Solvestic blog.`;

    const canonical = `${SITE_URL}/blogs/${blog.permalink}`;

    return {
        metadataBase: new URL(SITE_URL),
        title,
        description,
        alternates: {
            canonical,
        },
        openGraph: {
            type: "article",
            title,
            description,
            url: canonical,
            siteName: "Solvestic",
            publishedTime: blog.date
                ? new Date(blog.date).toISOString()
                : undefined,
            images: blog.image
                ? [
                    {
                        url: blog.image,
                        alt: blog.title,
                    },
                ]
                : [],
        },
        twitter: {
            card: blog.image ? "summary_large_image" : "summary",
            title,
            description,
            images: blog.image ? [blog.image] : [],
        },
    };
}

export default async function SingleBlogPage({ params }) {
    const { slug } = await params;
    const blog = await getBlog(slug);

    if (!blog) notFound();

    const publishedDate = blog.date
        ? new Date(blog.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : null;

    return (
        <main className="min-h-screen bg-white text-[#24202B]">
            <article className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 md:py-20">
                <header className="mx-auto mb-10 max-w-3xl text-center">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                        Solvestic Journal
                    </p>

                    <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                        {blog.title}
                    </h1>

                    {publishedDate && (
                        <p className="mt-5 text-sm text-gray-500">
                            Published on {publishedDate}
                        </p>
                    )}
                </header>

                {blog.image && (
                    <div className="mb-12 overflow-hidden rounded-2xl bg-[#F7F2FC]">
                        <img
                            src={blog.image}
                            alt={blog.title}
                            className="max-h-[560px] w-full object-cover"
                            fetchPriority="high"
                        />
                    </div>
                )}

                <div
                    className="blog-content mx-auto max-w-3xl text-base leading-8 text-gray-700 sm:text-lg"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                <div className="mx-auto mt-14 max-w-3xl border-t border-gray-200 pt-7">
                    <a
                        href="/newsletter"
                        className="inline-flex items-center gap-2 font-medium text-[#7D45C2] transition hover:gap-3"
                    >
                        <span aria-hidden="true">←</span>
                        Back to all blogs
                    </a>
                </div>
            </article>

            <style>{`
                .blog-content h1,
                .blog-content h2,
                .blog-content h3,
                .blog-content h4 {
                    color: #24202B;
                    font-weight: 600;
                    line-height: 1.3;
                    margin: 2rem 0 1rem;
                }

                .blog-content h1 { font-size: 2rem; }
                .blog-content h2 { font-size: 1.65rem; }
                .blog-content h3 { font-size: 1.3rem; }
                .blog-content p { margin: 1rem 0; }
                .blog-content ul { list-style: disc; padding-left: 1.5rem; margin: 1rem 0; }
                .blog-content ol { list-style: decimal; padding-left: 1.5rem; margin: 1rem 0; }
                .blog-content li { margin: 0.4rem 0; }
                .blog-content a { color: #7D45C2; text-decoration: underline; }
                .blog-content img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1.5rem 0; }
                .blog-content blockquote { border-left: 4px solid #7D45C2; padding-left: 1rem; margin: 1.5rem 0; color: #5b5565; }
                .blog-content table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; }
                .blog-content th, .blog-content td { border: 1px solid #e5e7eb; padding: 0.75rem; }
            `}</style>
        </main>
    );
}