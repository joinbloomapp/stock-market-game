import { PlayerEntity } from "@bloom-smg/postgresql";

export class PlayerNamesDto {
  playerId: string;
  userId: string;
  name: string;
  isGameAdmin: boolean;

  constructor(player: PlayerEntity) {
    this.playerId = player.id;
    this.userId = player.userId;
    this.name = player.user.name;
    this.isGameAdmin = player.isGameAdmin;
  }
}
