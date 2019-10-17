export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-calendar',
    },
    {
      name: 'Create Client',
      url: '/client',
      icon: 'icon-user-follow',
    },
    {
      name: 'All Clients',
      url: '/clients',
      icon: 'icon-people',
    },
    {
      name: 'Create New Job',
      url: '/create',
      icon:'icon-phone'
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
      icon: 'P',
        icon:'fa fa-ellipsis-h'
    },
    {
      name: 'Scheduled Jobs',
      url: '/scheduled',
        icon:'fa fa-calendar-o'
    },
    {
      name: 'Inspected Jobs',
      url: '/inspected',
        icon:'fa fa-tags'
    },
    {
      name: 'Completed Jobs',
      url: '/completed',
      icon:'fa fa-calendar-check-o'
    },
    {
      name: 'All Jobs',
      url: '/all',
      icon:'icon-layers'
    },
    {
      name: 'update mail merge',
      url: '/mailmerge',
      icon:'fa fa-envelope'
    }
  ]
};
