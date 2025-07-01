import { Table, Column, HeaderCell, Cell } from "rsuite-table";
import "rsuite-table/dist/css/rsuite-table.css";
import "rsuite/dist/styles/rsuite-default.css";

// Estilo para alinhar células verticalmente
const CellWithVerticalAlign = (props) => (
  <Cell
    {...props}
    style={{ display: "flex", alignItems: "center", height: "100%" }}
  >
    {props.children}
  </Cell>
);

const CustomTable = ({
  data,
  columns,
  loading,
  sortColumn,
  sortType,
  onSortColumn,
  onRowClick,
  isMobile,
  rowHeight = 46,
  page = 1,
  limit = 10,
  total = 0,
  onChangePage,
  onChangeLimit,
}) => {
  return (
    <div>
      <Table
        autoHeight
        data={data}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={onSortColumn}
        loading={loading}
        onRowClick={onRowClick}
        hover={true}
        bordered
        rowHeight={rowHeight}
        className="w-full"
      >
        {columns
          .filter((column) => !isMobile || !column.hideOnMobile)
          .map((column, index) => (
            <Column
              key={index}
              width={isMobile && column.key === "nome" ? "70%" : column.width}
              align={column.key === "actions" ? "right" : "left"}
              fixed={column.fixed}
            >
              <HeaderCell>{column.label}</HeaderCell>
              <CellWithVerticalAlign
                style={{
                  padding: isMobile ? "8px" : undefined,
                }}
              >
                {column.render
                  ? (rowData) => column.render(rowData[column.key], rowData)
                  : (rowData) => rowData[column.key]}
              </CellWithVerticalAlign>
            </Column>
          ))}
      </Table>
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-gray-50">
        <div className="w-full md:w-auto mb-3 md:mb-0 text-sm text-center md:text-left text-gray-700">
          Mostrando {data.length} de {total} registros
        </div>
        <div className="w-full md:w-auto flex justify-center space-x-1">
          <button
            onClick={() => onChangePage(1)}
            disabled={page <= 1}
            className="px-2 py-1 text-xs md:text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200"
          >
            {isMobile ? "<<" : "Primeira"}
          </button>
          <button
            onClick={() => onChangePage(page - 1)}
            disabled={page <= 1}
            className="px-2 py-1 text-xs md:text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200"
          >
            {isMobile ? "<" : "Anterior"}
          </button>
          <span className="px-2 py-1 text-sm">
            {page} / {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => onChangePage(page + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className="px-2 py-1 text-xs md:text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200"
          >
            {isMobile ? ">" : "Próxima"}
          </button>
          <button
            onClick={() => onChangePage(Math.ceil(total / limit))}
            disabled={page >= Math.ceil(total / limit)}
            className="px-2 py-1 text-xs md:text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200"
          >
            {isMobile ? ">>" : "Última"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTable;
