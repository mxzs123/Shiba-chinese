import clsx from "clsx";
import { ReactNode } from "react";

const Price = ({
  amount,
  className,
  currencyCode = "USD",
  currencyCodeClassName,
  prefix,
}: {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
  prefix?: ReactNode;
} & React.ComponentProps<"p">) => (
  <p suppressHydrationWarning={true} className={className}>
    {prefix ? <span className="mr-1 align-baseline">{prefix}</span> : null}
    {`${new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(parseFloat(amount))}`}
    <span
      className={clsx("ml-1 inline", currencyCodeClassName)}
    >{`${currencyCode}`}</span>
  </p>
);

export default Price;
