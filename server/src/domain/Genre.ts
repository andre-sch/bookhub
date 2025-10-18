class Genre {
  public ID: string;
  public name: string;

  constructor(ID?: string) {
    this.ID = ID || crypto.randomUUID();
  }
}

export { Genre };
