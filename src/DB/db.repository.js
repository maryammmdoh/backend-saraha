export async function findOne({
    model,
    filters = {},
    select = "",
    populate = false,
    populateFields = "",
}) 
{
    let result;

    if (populate) {
        result = await model
        .findOne(filters)
        .select(select)
        .populate(populateFields);
    } else {
        result = await model.findOne(filters).select(select);
    }
    return result;
}

export async function create({ model, inserteddata, Options = {} }) {
  const [result] = await model.create([inserteddata], Options);
  return result;
}

export async function findByid({
    model,
    id,
    select = "",
    populate = false,
    populateFields = "",
}) {
    let result;
    if (populate) {
        result = await model
        .findById(id)
        .select(select)
        .populate(populateFields);
    }
        else {  
        result = await model.findById(id).select(select);
    }
    return result;
}

export async function updateOne({
    model,
    updateData,
    filters,
    Options
}) {
    const result = await model.updateOne(filters, updateData, Options);
    return result;
}

export async function find({
    model,
    filters = {},
    select = "",
    populate = false,
    populateFields = "",
}) {
    let result;
    if (populate) {
        result = await model.find(filters).select(select).populate(populateFields);
    } else {
        result = await model.find(filters).select(select);
    }
    return result;
}

export async function deleteOne({
    model,
    filters = {},
    Options
}) {
    const result = await model.deleteOne(filters, Options);
    return result;
}

export async function findByIdAndUpdate({
    model,
    id,
    updateData,
    select = "",
    populate = false,
    populateFields = "",
    Options
}) {
    let result;
    if (populate) {
        result = await model.findByIdAndUpdate(id, updateData, Options).select(select).populate(populateFields);
    } else {
        result = await model.findByIdAndUpdate(id, updateData, Options).select(select);
    }
    return result;
}