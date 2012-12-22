dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
pushd $dir > /dev/null
psql -q -h localhost -c "DROP DATABASE hikeio" > /dev/null
rm -f ../../development.db
popd > /dev/null