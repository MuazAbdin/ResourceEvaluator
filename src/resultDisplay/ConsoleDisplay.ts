import { table, TableUserConfig } from "table";

interface Data {
  title: string;
  header: Array<string>;
  items: Array<string[]>;
}

export default class ConsoleDisplay {
  public static display(data: Data) {
    const cols = data.header.length;
    const tableTitle = [data.title, ...Array.from({ length: cols - 1 }, () => "")];

    const tableData = [tableTitle, data.header, ...data.items];
    const config: TableUserConfig = {
      spanningCells: [{ col: 0, row: 0, colSpan: cols, alignment: "center" }],
    };

    console.log(table(tableData, config));
  }
}