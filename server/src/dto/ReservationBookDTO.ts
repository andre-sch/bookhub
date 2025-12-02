export interface ReservationBookDTO {
    reservationID: number;
    startAt: string;
    endAt: string;
    itemStatus: string;
    itemID: string;
    bookTitle: string;
    bookIsbn: string;
    authors: string[];
}