export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
    },
    {
      title: true,
      name: 'Actions',
      wrapper: {            // optional wrapper object
        element: '',        // required valid HTML5 element tag
        attributes: {}        // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
      },
      class: ''             // optional class names space delimited list for title item ex: "text-center"
    },
    {
      name: 'Create Client',
      url: '/CreateClients',
    },
    {
      name: 'Create New Job',
      url: '/create',
    },
    {
      name: 'Open Jobs',
      url: '/open',
    },
    {
      name: 'Completed Jobs',
      url: '/completed',
    }
  ]
};
