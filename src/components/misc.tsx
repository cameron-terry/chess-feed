export class AutoId {
  static newId(): string {
    // Alphanumeric characters
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let autoId = "";
    for (let i = 0; i < 20; i++) {
      autoId = autoId + chars[Math.floor(Math.random() * chars.length)];
    }

    return autoId;
  }
}
