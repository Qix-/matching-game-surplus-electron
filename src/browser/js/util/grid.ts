export function grid(columns: string | number | string[], rows?: string | number | string[]): object {
	if (typeof columns === 'number') {
		columns = new Array(columns);
		columns.fill('1fr');
	} else if (Array.isArray(columns)) {
		columns = columns.join(' ');
	}

	if (rows === undefined) {
		rows = columns;
	} else if (typeof rows === 'number') {
		rows = new Array(rows);
		rows.fill('1fr');
	} else if (Array.isArray(rows)) {
		rows = rows.join(' ');
	}

	return {
		display: 'grid',
		gridTemplateColumns: columns,
		gridTemplateRows: rows
	};
};

grid.child = function(column: number | [number, number], row: number | [number, number]): object {
	if (typeof column === 'number') {
		column = [column, column + 1];
	}

	if (typeof row === 'number') {
		row = [row, row + 1];
	}

	return {
		gridColumn: column.join(' / '),
		gridRow: row.join(' / ')
	};
};

grid.gap = function(column: string, row?: string): object {
	if (!row) {
		row = column;
	}

	return {
		gridColumnGap: column,
		gridRowGap: row
	};
};
