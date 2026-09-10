import { Church, ChurchLocation } from '../types';

export const CONTINENTS = [
  'North America',
  'Europe',
  'Africa',
  'Oceania',
  'Asia',
  'South America'
] as const;

export const INITIAL_CHURCHES: Church[] = [
  // California, USA
  {
    id: 'church-ca-1',
    name: 'Grace Community Church',
    city: 'Sun Valley',
    state: 'California',
    country: 'United States',
    continent: 'North America',
    leadPastor: 'John MacArthur',
    description: 'A historic Bible-teaching community located in the San Fernando Valley, California.',
    website: 'https://www.gracechurch.org'
  },
  {
    id: 'church-ca-2',
    name: 'Bethel Church',
    city: 'Redding',
    state: 'California',
    country: 'United States',
    continent: 'North America',
    leadPastor: 'Bill Johnson',
    description: 'A worship and revival community based in Northern California known for worship and ministry.',
    website: 'https://www.bethel.com'
  },
  {
    id: 'church-ca-3',
    name: 'Reality LA',
    city: 'Los Angeles',
    state: 'California',
    country: 'United States',
    continent: 'North America',
    leadPastor: 'Jeremy Treat',
    description: 'A gospel-centered church seeking the renewal of Los Angeles.',
    website: 'https://realityla.com'
  },
  {
    id: 'church-ca-4',
    name: 'The Rock Church',
    city: 'San Diego',
    state: 'California',
    country: 'United States',
    continent: 'North America',
    leadPastor: 'Miles McPherson',
    description: 'A pervasive community impact church situated in San Diego, California.',
    website: 'https://www.sdrock.com'
  },

  // Texas, USA
  {
    id: 'church-tx-1',
    name: 'The Village Church',
    city: 'Flower Mound',
    state: 'Texas',
    country: 'United States',
    continent: 'North America',
    leadPastor: 'Matt Chandler',
    description: 'A community that loves God and proclaims the gospel across the Dallas-Fort Worth metroplex.',
    website: 'https://www.thevillagechurch.net'
  },
  {
    id: 'church-tx-2',
    name: 'Gateway Church',
    city: 'Southlake',
    state: 'Texas',
    country: 'United States',
    continent: 'North America',
    leadPastor: 'Robert Morris',
    description: 'A multi-campus Bible-based church centered on worship and prophetic teaching.',
    website: 'https://gatewaypeople.com'
  },

  // Georgia, USA
  {
    id: 'church-ga-1',
    name: 'Passion City Church',
    city: 'Atlanta',
    state: 'Georgia',
    country: 'United States',
    continent: 'North America',
    leadPastor: 'Louie Giglio',
    description: 'For the fame of Jesus and the glory of God in Atlanta and beyond.',
    website: 'https://passioncitychurch.com'
  },

  // Illinois, USA
  {
    id: 'church-il-1',
    name: 'City Light Cathedral',
    city: 'Chicago',
    state: 'Illinois',
    country: 'United States',
    continent: 'North America',
    leadPastor: 'Rev. Mark Thompson',
    description: 'A beacon of hope and theological depth in the heart of Chicago.',
    website: 'https://citylightcathedral.org'
  },

  // North Carolina, USA
  {
    id: 'church-nc-1',
    name: 'Hope Chapel',
    city: 'Charlotte',
    state: 'North Carolina',
    country: 'United States',
    continent: 'North America',
    leadPastor: 'Ps. Michael Scott',
    description: 'A community of worship, outreach, and generosity in North Carolina.',
    website: 'https://hopechapelclt.org'
  },

  // United Kingdom / Europe
  {
    id: 'church-uk-1',
    name: 'Holy Trinity Brompton (HTB)',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    continent: 'Europe',
    leadPastor: 'Nicky Gumbel',
    description: 'An Anglican church in central London, birthplace of the global Alpha Course.',
    website: 'https://www.htb.org'
  },
  {
    id: 'church-uk-2',
    name: 'All Souls Langham Place',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    continent: 'Europe',
    leadPastor: 'Charlie Skrine',
    description: 'Prominent evangelical church in London founded on deep expository biblical preaching.',
    website: 'https://www.allsouls.org'
  },

  // Nigeria / Africa
  {
    id: 'church-ng-1',
    name: 'The Elevation Church',
    city: 'Lekki',
    state: 'Lagos',
    country: 'Nigeria',
    continent: 'Africa',
    leadPastor: 'Godman Akinlabi',
    description: 'Empowering people to achieve greatness and make positive impacts across Africa.',
    website: 'https://elevationng.org'
  },
  {
    id: 'church-ng-2',
    name: 'Daystar Christian Centre',
    city: 'Ikeja',
    state: 'Lagos',
    country: 'Nigeria',
    continent: 'Africa',
    leadPastor: 'Sam Adeyemi',
    description: 'Raising role models and teaching practical biblical leadership principles.',
    website: 'https://daystarng.org'
  },
  {
    id: 'church-ng-3',
    name: 'House on the Rock',
    city: 'Lekki',
    state: 'Lagos',
    country: 'Nigeria',
    continent: 'Africa',
    leadPastor: 'Paul Adefarasin',
    description: 'A vibrant worshipping community hosting The Experience international worship concert.',
    website: 'https://houseontherock.org.ng'
  },

  // Kenya / Africa
  {
    id: 'church-ke-1',
    name: 'Nairobi Chapel',
    city: 'Nairobi',
    state: 'Nairobi County',
    country: 'Kenya',
    continent: 'Africa',
    leadPastor: 'Oscar Muriu',
    description: 'Growing disciples through community outreaches and church planting across East Africa.',
    website: 'https://nairobichapel.org'
  },

  // Australia / Oceania
  {
    id: 'church-au-1',
    name: 'Hillsong Church',
    city: 'Sydney',
    state: 'New South Wales',
    country: 'Australia',
    continent: 'Oceania',
    leadPastor: 'Phil Dooley',
    description: 'A contemporary Christian church and global praise and worship ministry.',
    website: 'https://hillsong.com'
  },

  // Singapore / Asia
  {
    id: 'church-sg-1',
    name: 'New Creation Church',
    city: 'Singapore',
    state: 'Singapore',
    country: 'Singapore',
    continent: 'Asia',
    leadPastor: 'Joseph Prince',
    description: 'Proclaiming the good news of the grace of our Lord Jesus Christ.',
    website: 'https://www.newcreation.org.sg'
  },

  // Brazil / South America
  {
    id: 'church-br-1',
    name: 'Igreja Batista da Lagoinha',
    city: 'Belo Horizonte',
    state: 'Minas Gerais',
    country: 'Brazil',
    continent: 'South America',
    leadPastor: 'Marcio Valadao',
    description: 'One of the most active Christian movements and worship communities in Latin America.',
    website: 'https://lagoinha.com'
  }
];
