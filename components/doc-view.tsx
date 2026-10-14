import type { DocBlock } from "@/lib/documents";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DocView({ blocks }: { blocks: DocBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "h") return <h3 key={index}>{block.text}</h3>;
        if (block.type === "ul") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "table") {
          return (
            <div className="my-4" key={index}>
              <Table>
                <TableHeader>
                  <TableRow>
                    {block.headers.map((header, headerIndex) => (
                      <TableHead key={`${header}-${headerIndex}`}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {block.rows.map((row) => (
                    <TableRow key={row.join("|")}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={`${cell}-${cellIndex}`}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        }
        return <p key={index}>{block.text}</p>;
      })}
    </>
  );
}
