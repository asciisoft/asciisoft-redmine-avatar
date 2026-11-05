require 'fileutils'
require 'securerandom'

module AsciisoftRedmineAvatar
  # 사진 파일은 Redmine 첨부파일 저장소(files) 아래 asciisoft_avatars 폴더에 사용자 ID 이름으로 저장한다.
  # 데이터베이스는 쓰지 않으므로 마이그레이션이 필요 없다.
  module Storage
    MAX_BYTES = 2 * 1024 * 1024
    TYPES = { 'jpg' => 'image/jpeg', 'png' => 'image/png' }.freeze
    JPEG_MAGIC = "\xFF\xD8\xFF".b.freeze
    PNG_MAGIC = "\x89PNG\r\n\x1A\n".b.freeze

    module_function

    def directory
      File.join(Attachment.storage_path, 'asciisoft_avatars')
    end

    def path_for(user, ext)
      File.join(directory, "#{user.id.to_i}.#{ext}")
    end

    # [경로, 확장자] 또는 nil
    def find(user)
      return nil unless user.is_a?(User) && user.id

      TYPES.each_key do |ext|
        path = path_for(user, ext)
        return [path, ext] if File.file?(path)
      end
      nil
    end

    def version(user)
      found = find(user)
      found ? File.mtime(found[0]).to_i : nil
    end

    # 파일 앞부분(매직 넘버)으로 형식을 판단한다. 확장자나 브라우저가 보낸 형식은 믿지 않는다.
    def detect(bytes)
      head = bytes.to_s.byteslice(0, 8).to_s.b
      return 'jpg' if head.start_with?(JPEG_MAGIC)
      return 'png' if head.start_with?(PNG_MAGIC)

      nil
    end

    def save(user, bytes)
      return false if bytes.nil? || bytes.bytesize.zero? || bytes.bytesize > MAX_BYTES

      ext = detect(bytes)
      return false unless ext

      FileUtils.mkdir_p(directory)
      delete(user)
      target = path_for(user, ext)
      tmp = "#{target}.#{SecureRandom.hex(6)}.tmp"
      File.binwrite(tmp, bytes)
      File.rename(tmp, target)
      true
    ensure
      FileUtils.rm_f(tmp) if tmp && File.exist?(tmp)
    end

    def delete(user)
      return unless user&.id

      TYPES.each_key { |ext| FileUtils.rm_f(path_for(user, ext)) }
    end
  end
end
