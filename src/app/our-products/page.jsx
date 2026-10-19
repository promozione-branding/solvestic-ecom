import React from 'react'
import Products from './Products'
import Review from "@/components/ourproducts/ReviewTestimonials";

export const metadata = {
    title: "Shop Skincare Products Online in India | Solvestic",
    description: "Shop SOLVESTIC skincare products, including pigment-correcting face cleanser, hydrating moisturiser and skincare combos for brighter, smoother-looking skin.",
};

export default function page() {
    return (
        <>
            <Products />
            <Review />
        </>
    )
}
