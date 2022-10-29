export interface MessageInterface {
  id: string;
  type: string;
  from: string;
  content: string;
  isGroup: boolean;
  isStatus: boolean;
  time: Date;
  sender: SenderInterface;
}

export interface SenderInterface {
  id: string;
  contactName: string;
  profileName: string;
  urlProfileImage: string;
  isMyContact: boolean;
}

export interface Chat {
  name: string;
  unreadCount: number;
  pinned: boolean;
  isMuted: boolean;
  muteExpiration: number;
  isGroup: boolean;
}

//generic contract for implementation
export interface WhatsappClientInterface {
  onMessage(cb: (message: MessageInterface) => void);
  getUnreadChats(): Promise<Chat[]>;
}

//generic contract for implementation
export interface WhatsappAdapter {
  create(
    id: string,
    onQr: (qr: string) => void
  ): Promise<WhatsappClientInterface>;
}
