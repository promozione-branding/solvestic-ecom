import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Product from "@/models/product.model";
import AllProductReviews from "./AllProductReviews";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { slug } = await params;

  await connectDB();

  const product = await Product.findOne({ slug })
    .select("_id name slug")
    .lean();

  if (!product) {
    notFound();
  }

  return (
    <AllProductReviews
      productId={product._id.toString()}
      productName={product.name}
      productSlug={product.slug}
    />
  );
}