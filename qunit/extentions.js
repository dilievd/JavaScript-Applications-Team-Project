function areSameEntries(entry1, entry2) {
    for (var prop in entry1) {
        if (entry1[prop] != entry2[prop]) {
            return false;
        }
    }
    return true;
}