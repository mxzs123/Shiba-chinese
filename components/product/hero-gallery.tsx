"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { GridTileImage } from "components/grid/tile";
import { useProduct, useUpdateURL } from "components/product/product-context";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function HeroGallery({
  images,
}: {
  images: { src: string; altText: string }[];
}) {
  const { state, updateImage } = useProduct();
  const updateURL = useUpdateURL();
  const imageIndex = state.image ? parseInt(state.image, 10) : 0;

  const totalImages = images.length;
  const hasMultiple = totalImages > 1;
  const nextIndex = imageIndex + 1 < totalImages ? imageIndex + 1 : 0;
  const previousIndex = imageIndex === 0 ? totalImages - 1 : imageIndex - 1;

  const changeImage = (index: number) => () => {
    const newState = updateImage(index.toString());
    updateURL(newState);
  };

  return (
    <form className="flex h-full w-full flex-col items-center">
      <div className="relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50">
        {images[imageIndex] ? (
          <Image
            fill
            priority
            className="h-full w-full object-contain"
            sizes="(min-width: 1024px) 480px, 100vw"
            alt={images[imageIndex]?.altText as string}
            src={images[imageIndex]?.src as string}
          />
        ) : null}
        {hasMultiple ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center gap-1.5">
            {images.map((image, index) => (
              <span
                key={image.src}
                aria-hidden
                className={`h-1.5 w-6 rounded-full transition ${
                  index === imageIndex
                    ? "bg-teal-500"
                    : "bg-white/70 backdrop-blur"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {totalImages ? (
        <div className="mt-4 flex w-full max-w-[480px] items-center gap-3 lg:mt-5">
          {hasMultiple ? (
            <button
              type="submit"
              formAction={changeImage(previousIndex)}
              aria-label="上一张商品图"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:border-teal-100 hover:text-teal-600"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          ) : null}
          <ul
            className={cn(
              "flex items-center gap-3 overflow-x-auto",
              hasMultiple ? "flex-1" : "mx-auto",
            )}
          >
            {images.map((image, index) => (
              <li key={image.src} className="shrink-0">
                <button
                  type="submit"
                  formAction={changeImage(index)}
                  aria-label={`查看第 ${index + 1} 张商品图`}
                  className="block h-20 w-20 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                  <GridTileImage
                    alt={image.altText}
                    src={image.src}
                    width={80}
                    height={80}
                    active={index === imageIndex}
                  />
                </button>
              </li>
            ))}
          </ul>
          {hasMultiple ? (
            <button
              type="submit"
              formAction={changeImage(nextIndex)}
              aria-label="下一张商品图"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:border-teal-100 hover:text-teal-600"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
