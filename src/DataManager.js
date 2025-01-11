const isTampermonkey = typeof GM !== 'undefined';

export const DataManager = {
    async getMappings() {
        if (isTampermonkey) {
            return JSON.parse(await GM.getValue('classMapping', '{}'));
        }
        const data = localStorage.getItem('classMapping');
        return JSON.parse(data || '{}');
    },
    async saveMappings(mappings) {
        if (isTampermonkey) {
            await GM.setValue('classMapping', JSON.stringify(mappings));
        } else {
            localStorage.setItem('classMapping', JSON.stringify(mappings));
        }
    },
    async deleteMapping(className) {
        const mappings = await this.getMappings();
        delete mappings[className];
        await this.saveMappings(mappings);
    }
};
