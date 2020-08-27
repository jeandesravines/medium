
export type QueryObjectOperator = FirebaseFirestore.WhereFilterOp
export type QueryObjectPredicate = { [key in QueryObjectOperator]: any }
export type QueryObjectValue = QueryObjectPredicate | any
export type QueryObject = { [path: string]: QueryObjectValue }
