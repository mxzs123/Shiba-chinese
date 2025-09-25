import clsx from "clsx";

type GridProps = React.ComponentProps<"ul">;

type GridItemProps = React.ComponentProps<"li"> & {
  aspect?: "auto" | "square";
};

function Grid(props: GridProps) {
  return (
    <ul
      {...props}
      className={clsx("grid grid-flow-row gap-4", props.className)}
    >
      {props.children}
    </ul>
  );
}

function GridItem({ aspect = "auto", className, ...props }: GridItemProps) {
  return (
    <li
      {...props}
      className={clsx(
        "transition-opacity",
        aspect === "square" ? "aspect-square" : undefined,
        className,
      )}
    >
      {props.children}
    </li>
  );
}

Grid.Item = GridItem;

export default Grid;
