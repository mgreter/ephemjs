################################################################################
# AstroJS VSOP2013 converter script (c) 2016 by Marcel Greter
################################################################################
# Very quick and dirty perl script to get the job done.
################################################################################
use strict;
use warnings;

use JSON qw();
use File::Path;
use File::Slurp;

our $accuracy = 10e-6;
unless(defined $ARGV[0]) {
	warn "using default precision of 10e-6\n";
} else {
	$accuracy = $ARGV[0];
}

our $target = 'src';
if(defined $ARGV[1]) {
	$target = $ARGV[1];
	if (!-d $target && !File::Path::make_path($target)) {
		warn "could not create $target\n";
	}
}

sub parse_coeffs
{

	my ($body, $idx, $coeffs) = @_;
	my $float = qr/[-+]?(?:[.]\d+|\d+(?:[.]\d*)?)(?:e[+-]\d+)?/;
	my ($factors);

	# open input data file and read by line
	my $file = sprintf "data/%s.S%d", $body, $idx;
	open(my $fh, "<", $file) or die "could not open $file\n$!";

	# parse elp2000 data file by lines
	my ($problem, $param, $id, $pow);
	while (defined(my $line = <$fh>))
	{
		# check for header line
		if ($line =~ m/^\s*([A-Z][A-Z ]*)\.\s+([A-Z][A-Z ]*)\.\s+(\d+)(?:\s+(\d+))?/) {
			($problem, $param, $id, $pow) = ($1, $2, $3, $4 || 0);
			unless (exists $coeffs->{$problem})
			{ $coeffs->{$problem} = {}; }
			unless (exists $coeffs->{$problem}->{$param})
			{ $coeffs->{$problem}->{$param} = []; }
			push @{$coeffs->{$problem}->{$param}}, $factors = [];
		} elsif (!$line =~ m/^[\+\-\D\e\. ]+$/) {
			warn "unrecocnised line:\n$line\n";
		} else {
			$line =~ s/D/e/g;
			my @factors;
			while ($line =~ s/^\s*($float)//) {
				push @factors, $1 + 0;
			}
			if ($problem eq "PERTURBATIONS") {
				# apply the precision - there are no instructions how
				# to truncate the series, so I took an educated guess
				next if ($factors[1]**2+$factors[2]**2 < $accuracy);
			}
			pop @factors while (scalar(@factors) && $factors[-1] == 0);
			die "not everything parsed <<$line>>" unless $line =~ m /^\s*$/;
			push @{$factors}, \ @factors;
		}
	}

}

sub gen_elp2000_four
{
	&parse_coeffs;
}

sub gen_elp2000_pois
{
	&parse_coeffs;
}

############################################################
# Main program to generate all theories starts here
############################################################

my $coeffs = {};

gen_elp2000_four("ELP_MAIN", 1, $coeffs);
gen_elp2000_four("ELP_MAIN", 2, $coeffs);
gen_elp2000_four("ELP_MAIN", 3, $coeffs);
gen_elp2000_pois("ELP_PERT", 1, $coeffs);
gen_elp2000_pois("ELP_PERT", 2, $coeffs);
gen_elp2000_pois("ELP_PERT", 3, $coeffs);

# create json exporter
my $json = new JSON;
# sort keys in objects
$json->canonical(1);


# export coefficients to js
my $four_lat = $json->encode($coeffs->{'MAIN PROBLEM'}->{'LATITUDE'});
my $four_lon = $json->encode($coeffs->{'MAIN PROBLEM'}->{'LONGITUDE'});
my $four_dist = $json->encode($coeffs->{'MAIN PROBLEM'}->{'DISTANCE'});
my $pois_lat = $json->encode($coeffs->{'PERTURBATIONS'}->{'LATITUDE'});
my $pois_lon = $json->encode($coeffs->{'PERTURBATIONS'}->{'LONGITUDE'});
my $pois_dist = $json->encode($coeffs->{'PERTURBATIONS'}->{'DISTANCE'});

# generate javascript code
# create the javascript code
my $code = "// generated by elpmpp02.pl

ELPMPP02(elpmpp02, GMJY.ear + GMJY.moon, [
	$four_lon,
	$four_lat,
	$four_dist,
	$pois_lon,
	$pois_lat,
	$pois_dist,
]);
";

# write the file with coefficients
write_file "$target/elpmpp02.js", $code;

############################################################
# Create the unit test file
############################################################
my %qidmap = (2 => 0, 4 => 1, 6 => 2, 8 => 3, 9 => 4, 12 => 5);
if ($target =~ m/^src[\/\\](\d+)-(\w+)/) {
	my ($id, $qid, $qname) = ($1, $qidmap{$1+0}, $2);
	my $config = { binmode => ':raw' };
	my $tmpl = read_file( 'conf/unit-test.thtml', $config);
	die "could not read unit test template" unless $tmpl;
	my $path = sprintf('../../test/elpmpp02/%02d-%s.html', $id, $qname);
	$tmpl =~ s/%%id%%/$qid/g; write_file($path, $config, $tmpl);
}
