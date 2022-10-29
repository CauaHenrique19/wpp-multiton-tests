export interface TypeMultiton<T> {
  id: string;
  instance: T;
}

export interface MultitonInterface<T> {
  /** 
    @param {TypeMultiton<T>} instanceToAdd Instance to add in list of intances
    @returns {TypeMultiton<T>} union of instance and id used to search (if the value was added successfully)
  */
  addInstance(instanceToAdd: TypeMultiton<T>): Promise<TypeMultiton<T>>;

  /** 
    @param {string} id Id to search instance
    @returns {TypeMultiton<T>} union of instance and id used to search (if value has been found)
  */
  getInstance(id: string): Promise<TypeMultiton<T>>;
}

export class Multiton<T> implements MultitonInterface<T> {
  private readonly instances: TypeMultiton<T>[] = [];

  public addInstance(instanceToAdd: TypeMultiton<T>): Promise<TypeMultiton<T>> {
    return new Promise<TypeMultiton<T>>((resolve, reject) => {
      const instanceInList = this.instances.find(
        (instance) => instance.id === instanceToAdd.id
      );
      if (instanceInList) {
        reject();
      }

      this.instances.push(instanceToAdd);
      resolve(instanceToAdd);
    });
  }

  public getInstance(id: string): Promise<TypeMultiton<T>> {
    return new Promise<TypeMultiton<T>>((resolve) => {
      const instance = this.instances.find((instance) => instance.id === id);
      resolve(instance);
    });
  }
}
