class Publisher {
  private _name: string;
  private _displayName: string;
  private _createdAt: number;

  constructor(createdAt?: number) {
    this._createdAt = createdAt || Date.now();
  }

  public get name(): string {
    return this._name;
  }

  public get displayName(): string {
    return this._displayName;
  }

  public set displayName(value: string) {
    this._displayName = value;
    this._name = value.toLowerCase().trim();
  }

  public get createdAt(): number {
    return this._createdAt;
  }
}

export { Publisher };
