export interface GroupedRows<T> {
  label: string | number;
  dimensions: Record<string | number, T>;
}

/**
 * Given database rows where we want to pivot by two rows, group the data.
 *
 * @param labelColumn is the column that contains the labels. For line charts this is the X axis.
 * @param dimensionColumn is the column with the values for which we want to create dimensions.
 * Given an array of rows with columns like this: week, org, a, b, c
 * groupRows('week', 'org') returns this format:
 *
 * {
 *   label: 0,
 *   dimensions: {
 *     'orgA': { value for week 0, org orgA },
 *     'orgB': { value for week 0, org orgB }
 *   }
 * },
 * {
 *   label: 1,
 *   dimensions: {
 *     'orgA': { value for week 1, org orgA },
 *     'orgB': { value for week 1, org orgB }
 *   }
 * },
 * etc...
 */
export function groupRows<T, L extends keyof T>(
  labelColumn: L,
  dimensionColumn: keyof T,
  data: T[]
) {
  let dimensionNames = new Set<keyof T>();

  let output = new Map<T[typeof labelColumn], GroupedRows<T>>();

  for (let row of data) {
    let label = row[labelColumn];
    let dimension = row[dimensionColumn];

    dimensionNames.add(dimensionColumn);

    let item = output.get(label);
    if (item) {
      item.dimensions[(dimension as unknown) as string | number] = row;
    } else {
      output.set(label, {
        label: (label as unknown) as string | number,
        dimensions: {
          [(dimension as unknown) as string | number]: row,
        },
      });
    }
  }

  return {
    dimensionNames,
    rows: Array.from(output.values()),
  };
}
