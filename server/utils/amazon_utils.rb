require "aws-sdk"

class AmazonUtils
	S3 = AWS::S3.new(
		:access_key_id     => ENV["S3_ACCESS_KEY_ID"],
		:secret_access_key => ENV["S3_SECRET_ACCESS_KEY"]
	)

	def self.s3
		S3
	end
end