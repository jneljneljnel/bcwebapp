export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
    },
    {
      name: 'Create Client',
      url: '/client',
    },
    {
      name: 'All Clients',
      url: '/clients',
    },
    {
      name: 'Create New Job',
      url: '/create',
    },
    {
      title: true,
      name: 'Jobs',
      wrapper: {            // optional wrapper object
        element: '',        // required valid HTML5 element tag
        attributes: {}        // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
      },
      class: ''             // optional class names space delimited list for title item ex: "text-center"
    },
    {
      name: 'Pending Jobs',
      url: '/pending',
    },
    {
      name: 'Scheduled Jobs',
      url: '/scheduled',
    },
    {
      name: 'Inspected Jobs',
      url: '/inspected',
    },
    {
      name: 'Completed Jobs',
      url: '/completed',
    }
  ]
};
