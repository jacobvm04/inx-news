export function isUniquenessError(err){
    if (!err) return false;
    const re = /duplicate key value violates unique constraint/;
    return re.test(err.message);
}
