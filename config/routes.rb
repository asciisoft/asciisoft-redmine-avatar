get    'my/avatar', to: 'asciisoft_avatars#edit', as: 'asciisoft_my_avatar'
post   'my/avatar', to: 'asciisoft_avatars#update'
delete 'my/avatar', to: 'asciisoft_avatars#destroy'
get    'asciisoft_avatars/:id', to: 'asciisoft_avatars#show', as: 'asciisoft_avatar', constraints: { id: /\d+/ }
