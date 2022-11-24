export interface MessageInterface {
  id: string;
  type: string;
  from: string;
  content: string;
  isGroup: boolean;
  isStatus: boolean;
  time: Date;
  sender: SenderInterface;
  selectedRowId?: string;
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

export interface Section {
  title: string;
  rows: {
    id: string;
    title: string;
    description: string;
  }[];
}

export interface List {
  body: string;
  buttonText: string;
  sections: Section[];
  title?: string;
  footer?: string;
}

//generic contract for implementation
export interface WhatsappClientInterface {
  onMessage(cb: (message: MessageInterface) => void);
  getUnreadChats(): Promise<Chat[]>;
  sendMessage(number: string, content: List | any);
  onAckUpdated();
}

//generic contract for implementation
export interface WhatsappAdapter {
  create(id: string, onQr: (qr: string) => void): Promise<WhatsappClientInterface>;
}
