import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import { Pagination } from 'rsuite';
import 'rsuite-table/dist/css/rsuite-table.css';

// Estilo para alinhar células verticalmente
const CellWithVerticalAlign = props => (
    <Cell {...props} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
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
    total,
    onChangePage,
    onChangeLimit
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
                {columns.map((column, index) => {
                    // Skip non-mobile columns on mobile view
                    if (isMobile && column.hideOnMobile) return null;

                    return (
                        <Column 
                            key={index}
                            width={isMobile ? column.mobileWidth || column.width : column.width}
                            fixed={column.fixed}
                            
                        >
                            <HeaderCell>{column.label}</HeaderCell>
                            <CellWithVerticalAlign>
                                {column.render 
                                    ? (rowData) => column.render(rowData[column.key], rowData)
                                    : (rowData) => rowData[column.key]
                                }
                            </CellWithVerticalAlign>
                        </Column>
                    );
                })}
            </Table>
            {total && (
                <div className=" flex justify-end bg-gray-50 border-b border-gray-200 p-2">
                    <Pagination
                        prev
                        next
                        first
                        last
                        ellipsis
                        boundaryLinks
                        maxButtons={5}
                        size="md"
                        layout={['total', '-', 'limit', '|', 'pager', 'skip']}
                        total={total}
                        limitOptions={[10, 20, 30, 50]}
                        limit={limit}
                        activePage={page}
                        onChangePage={onChangePage}
                        onChangeLimit={onChangeLimit}
                    />
                </div>
            )}
        </div>
    );
};

export default CustomTable;
