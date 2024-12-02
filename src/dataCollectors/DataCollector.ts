/**
 * Data collector interface, defines the methods a resource data collecter
 * must implement.
 * <T> is the type of the data for single instance of the resource
 */
export default interface DataCollector<T> {
  /**
   * collects the data for all the instances of a specific resource
   * in the current AWS profile.
   * @returns an array of data with type <T>
   */
  getAll: (input?: any) => Promise<Array<T>>;

  /**
   *
   * @param id the id of the resource
   * @returns the data for the provided resource id
   */
  getOne: (id: string) => Promise<T>;
}
