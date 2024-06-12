import { Table, Button } from 'rsuite';
const { Column, Cell, HeaderCell } = Table;

const TableComponent = ({ data, config, actions, onRowClick, loading }) => {
    return (
        <Table loading={loading} data={data} height={400} onRowClick={onRowClick}>
            {config.map((c) => (
                <Column flexGrow={!c.width ? 1 : 0} width={c.width} fixed={c.fixed}>
                    <HeaderCell>{c.label}</HeaderCell>
                    {!c.content ? (
                        <Cell dataKey={c.key} />
                    ) : (
                        <Cell dataKey={c.key}>{(item) => c.content(item[c.key])}</Cell>
                    )}
                </Column>
            ))}
           
            <Column flexGrow={1} fixed="right" align="right">
                <HeaderCell />
                <Cell>
                    {(item) => (
                        <Button color="blue" size="xs">Ver informações</Button>
                    )}
                </Cell>
            </Column>
        </Table>
    );
};

export default TableComponent;