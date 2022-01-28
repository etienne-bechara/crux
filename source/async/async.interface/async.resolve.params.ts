export interface AsyncResolveParams<I, O> {
  data: I[];
  method: (d: I) => Promise<O>;
  limit: number;
}
