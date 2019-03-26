const STORE = {
    user: {
        '1': { name: 'nate' },
        '2': { name: 'kae' },
        '3': { name: 'deryk' },
        '4': { name: 'greg' },
        '5': { name: 'vane' },
        '6': { name: 'mars' },
        '7': { name: 'dagny' }
    },
    list: {
        '1': { owner: '1' }
    },
    item: {
        '1': { list: '1', completed: false, content: 'install dependencies' }
    }
};

type Filter = (record: any) => boolean;

export function findItems(collection: string, filter?: Filter): any {
    let records = STORE[collection];
    if (records) {
        records = Object.entries(records).map(([id, v]) => ({ ...v, id }));
        return filter ? records.filter(filter) : records;
    }
}

export function getItem(collection: string, id: string): any {
    let records = STORE[collection];
    if (records) {
        const record = records[id];
        return record && { ...record, id };
    }
}

export function setItem(collection: string, id: string, value: any): void {
    const records = STORE[collection];
    if (records) {
        records[id] = value;
    }
}
