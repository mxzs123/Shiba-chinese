import type { ReactNode } from "react";

interface DataTableColumn<T> {
  header: string;
  accessor?: keyof T;
  cell?: (row: T, rowIndex: number) => ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  rowKey?: (row: T, rowIndex: number) => string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "暂无数据",
  rowKey,
}: DataTableProps<T>) {
  const alignToClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr className="text-xs uppercase tracking-wide text-neutral-500">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`px-4 py-3 font-semibold ${alignToClass(column.align)} ${column.className ?? ""}`.trim()}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
          {loading
            ? renderLoadingState(columns.length)
            : renderRows({ data, columns, emptyMessage, rowKey, alignToClass })}
        </tbody>
      </table>
    </div>
  );
}

function renderLoadingState(columnCount: number) {
  const skeletons = Array.from({ length: 3 });

  return skeletons.map((_, rowIndex) => (
    <tr key={`loading-${rowIndex}`} className="animate-pulse text-neutral-400">
      {Array.from({ length: columnCount }).map((__, colIndex) => (
        <td key={`loading-cell-${rowIndex}-${colIndex}`} className="px-4 py-4">
          <div className="h-3 rounded bg-neutral-200" />
        </td>
      ))}
    </tr>
  ));
}

function renderRows<T>({
  data,
  columns,
  emptyMessage,
  rowKey,
  alignToClass,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  emptyMessage: string;
  rowKey?: (row: T, rowIndex: number) => string;
  alignToClass: (align?: "left" | "center" | "right") => string;
}) {
  if (data.length === 0) {
    return (
      <tr>
        <td
          colSpan={columns.length}
          className="px-4 py-10 text-center text-sm text-neutral-400"
        >
          {emptyMessage}
        </td>
      </tr>
    );
  }

  return data.map((row, rowIndex) => {
    const key = rowKey ? rowKey(row, rowIndex) : rowIndex.toString();

    return (
      <tr key={key} className="transition-colors hover:bg-neutral-50/70">
        {columns.map((column) => {
          const value = column.cell
            ? column.cell(row, rowIndex)
            : column.accessor
              ? (row[column.accessor] as ReactNode)
              : null;

          return (
            <td
              key={`${key}-${column.header}`}
              className={`px-4 py-3 ${alignToClass(column.align)} ${column.className ?? ""}`.trim()}
            >
              {value}
            </td>
          );
        })}
      </tr>
    );
  });
}
