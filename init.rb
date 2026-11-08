# ASCII SOFT Redmine Avatar
# 프로필 사진을 올려 Redmine 의 사용자 아이콘으로 쓰게 한다.
# License: GPL-2.0-or-later

Redmine::Plugin.register :asciisoft_redmine_avatar do
  name 'ASCII SOFT 프로필 사진'
  author 'ASCII SOFT'
  description '내 계정에서 프로필 사진을 올리고, 사용자 아이콘 자리에 표시합니다'
  version '1.1.0'
  url 'https://asciisoft.com'
  requires_redmine version_or_higher: '7.0.0'
end

# 아바타 표시 교체 (init.rb 는 to_prepare 안에서 실행되므로 바로 적용한다)
unless AvatarsHelper.ancestors.include?(AsciisoftRedmineAvatar::AvatarsHelperPatch)
  AvatarsHelper.prepend(AsciisoftRedmineAvatar::AvatarsHelperPatch)
end

# 사용자를 삭제하면 사진 파일도 지운다
unless User.method_defined?(:asciisoft_delete_avatar)
  User.class_eval do
    def asciisoft_delete_avatar
      AsciisoftRedmineAvatar::Storage.delete(self)
    end
    after_destroy :asciisoft_delete_avatar
  end
end

AsciisoftRedmineAvatar::Hooks
