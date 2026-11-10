import React from 'react'

function Reservations() {
  const [reservations, setReservations] = React.useState([
    { guestName: 'John Doe', checkInDate: '2023-10-01', checkOutDate: '2023-10-05', roomType: 'Deluxe' },
    { guestName: 'Jane Smith', checkInDate: '2023-10-10', checkOutDate: '2023-10-15', roomType: 'Standard' },
    { guestName: 'Alice Johnson', checkInDate: '2023-11-01', checkOutDate: '2023-11-03', roomType: 'Suite' },
  ]);


  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Guest Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Check-in Date</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Check-out Date</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Room Type</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reservation.guestName}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reservation.checkInDate}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reservation.checkOutDate}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reservation.roomType}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}><button>Annuller</button><button>Modifier</button><button>Accepter</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Reservations
