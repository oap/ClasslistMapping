export const DataManager = {
    async getMappings() {
        return JSON.parse(await GM.getValue('classMapping', '{}'));
    },
    async saveMappings(mappings) {
        await GM.setValue('classMapping', JSON.stringify(mappings));
    },
    async addMapping(className, d2lClassId, canvasClassId) {
        const mappings = await this.getMappings();
        mappings[className] = { d2lClassId, canvasClassId };
        await this.saveMappings(mappings);
    },
    async deleteMapping(className) {
        const mappings = await this.getMappings();
        delete mappings[className];
        await this.saveMappings(mappings);
    },
};
