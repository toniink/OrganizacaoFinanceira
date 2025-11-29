export const PETS = [
  {
    id: 'cat',
    name: 'Gatinho',
    icon: '🐱',
    price: 'Padrão',
    description: 'O clássico! Um companheiro felino que adora ver seu saldo positivo. Não deixe ele sem Whiskas!',
    // MODO LOCAL (Use assim quando tiver os arquivos):
    imageHappy: require('../../assets/pets/cat/happy.png'),
    imageWorried: require('../../assets/pets/cat/worried.png'),
    imageSad: require('../../assets/pets/cat/sad.png'),
    
    // MODO ONLINE (Para testar agora):
    // imageHappy: { uri: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' },
    // imageWorried: { uri: 'https://cdn-icons-png.flaticon.com/512/616/616554.png' },
    // imageSad: { uri: 'https://cdn-icons-png.flaticon.com/512/1998/1998664.png' },
    
    color: '#f0abfc' // Rosa
  },
  {
    id: 'dog',
    name: 'Cachorrinho',
    icon: '🐶',
    price: 'R$ 6,99',
    description: 'O melhor amigo do homem e do seu bolso. Ele fica abanando o rabo quando você economiza!',
    // imageHappy: require('../assets/pets/dog/happy.png'),
     imageHappy: require('../../assets/pets/dog/happy.png'),
    imageWorried: require('../../assets/pets/dog/worried.png'),
    imageSad: require('../../assets/pets/dog/sad.png'),
    
    // imageHappy: { uri: 'https://cdn-icons-png.flaticon.com/512/616/616440.png' },
    // imageWorried: { uri: 'https://cdn-icons-png.flaticon.com/512/616/616569.png' },
    // imageSad: { uri: 'https://cdn-icons-png.flaticon.com/512/1998/1998749.png' },

    color: '#fbbf24' // Amarelo
  },
  {
    id: 'duck',
    name: 'Patinho',
    icon: '🦆',
    price: 'R$ 6,99',
    description: 'Quack! Economize ou ele vai ficar muito chateado. Um pato de negócios sérios.',
    // imageHappy: require('../assets/pets/duck/happy.png'),
     imageHappy: require('../../assets/pets/duck/happy.png'),
    imageWorried: require('../../assets/pets/duck/worried.png'),
    imageSad: require('../../assets/pets/duck/sad.png'),

    // imageHappy: { uri: 'https://cdn-icons-png.flaticon.com/512/2632/2632838.png' },
    // imageWorried: { uri: 'https://cdn-icons-png.flaticon.com/512/2632/2632890.png' },
    // imageSad: { uri: 'https://cdn-icons-png.flaticon.com/512/2632/2632731.png' },

    color: '#fef08a' // Creme
  }
];