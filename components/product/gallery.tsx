"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { GridTileImage } from "components/grid/tile";
import { useProduct, useUpdateURL } from "components/product/product-context";
import Image from "next/image";

export function Gallery({
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
    <form className="space-y-5">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50">
        {images[imageIndex] ? (
          <Image
            fill
            priority
            className="h-full w-full object-contain"
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt={images[imageIndex]?.altText as string}
            src={images[imageIndex]?.src as string}
          />
        ) : null}

        {hasMultiple ? (
          <>
            <button
              type="submit"
              formAction={changeImage(previousIndex)}
              aria-label="上一张商品图"
              className="group absolute left-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-2xl border border-white/70 bg-white/90 p-3 text-neutral-700 shadow-sm transition hover:border-teal-100 hover:text-teal-600"
            >
              <ArrowLeftIcon className="h-5 w-5 transition group-hover:-translate-x-0.5" />
            </button>
            <button
              type="submit"
              formAction={changeImage(nextIndex)}
              aria-label="下一张商品图"
              className="group absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-2xl border border-white/70 bg-white/90 p-3 text-neutral-700 shadow-sm transition hover:border-teal-100 hover:text-teal-600"
            >
              <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-0.5" />
            </button>
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
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="flex items-center gap-3">
          <button
            type="submit"
            formAction={changeImage(previousIndex)}
            aria-label="上一张商品图"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:border-teal-200 hover:text-teal-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <ul className="flex flex-1 items-center gap-3 overflow-x-auto">
            {images.map((image, index) => {
              const isActive = index === imageIndex;

              return (
                <li key={image.src} className="shrink-0">
                  <button
                    type="submit"
                    formAction={changeImage(index)}
                    aria-label={`查看第 ${index + 1} 张商品图`}
                    className="relative block h-20 w-20 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                  >
                    <GridTileImage
                      alt={image.altText}
                      src={image.src}
                      width={80}
                      height={80}
                      active={isActive}
                    />
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-2xl ring-2 ring-inset ring-teal-500"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="submit"
            formAction={changeImage(nextIndex)}
            aria-label="下一张商品图"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:border-teal-200 hover:text-teal-600"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </form>
  );
}
